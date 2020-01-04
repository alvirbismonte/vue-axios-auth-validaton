/* eslint-disable no-unused-vars, no-console, no-unreachable */
import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'

import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    authUser (state, userData) {
      state.idToken = userData.idToken
      state.userId = userData.userId
      console.log('userData', state)
    },
    storeUser(state,user) {
      state.user = user
    },
    clearAuthData(state) {
      state.idToken = null
      state.userId = null
    }
  },
  actions: {
    setLogoutTimer({commit, dispatch}, expirationTime) {
      setTimeout(() => {
        // commit('clearAuthData')
        dispatch('logout')
      }, expirationTime * 3600)
    },
    signup ({commit, dispatch}, authData) {
      axios.post('/accounts:signUp?key=AIzaSyCdzhZhh0VIR2noPdXVUL6-BMTmWVGv5HU', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
      .then(response => {
        commit('authUser', {
          idToken: response.data.idToken,
          userId: response.data.localId
        })
        const now = new Date()
        const expirationDate = new Date(now.getTime() + response.data.expiresIn * 1000)
        localStorage.setItem('token', response.data.idToken)
        localStorage.setItem('userId', response.data.localId)
        localStorage.setItem('expirationDate', expirationDate)
        dispatch('storeUser', authData)
        dispatch('setLogoutTimer', response.data.expiresIn)
      })
      .catch( error => console.log(error))
    },
    signin ({commit, dispatch}, authData) {
      axios.post('/accounts:signInWithPassword?key=AIzaSyCdzhZhh0VIR2noPdXVUL6-BMTmWVGv5HU', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
      .then(response => {
        console.log(response)
        commit('authUser', {
          idToken: response.data.idToken,
          userId: response.data.localId
        })
        const now = new Date()
        const expirationDate = new Date(now.getTime() + response.data.expiresIn * 1000)
        localStorage.setItem('token', response.data.idToken)
        localStorage.setItem('userId', response.data.localId)
        localStorage.setItem('expirationDate', expirationDate)
        dispatch('setLogoutTimer', response.data.expiresIn)
        router.replace('/dashboard')
      })
      .catch( error => console.log(error))
    },
    tryAutoLogin({commit}) {
      const token = localStorage.getItem('token')
      if (!token) {
        return
      }
      const expirationDate = localStorage.getItem('expirationDate')
      const now = new Date()
      if (now >= expirationDate) {
        return
      }
      const userId = localStorage.getItem('userId')
      commit('authUser', {
        token: token,
        userId: userId
      })
    },
    logout({commit}) {
      commit('clearAuthData')
      // router.push('/signin')
      localStorage.removeItem('expirationDate')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      router.replace('/signin')
    },
    storeUser ({commit, state}, userData) {
      if (!state.idToken) {
        return
      }
      globalAxios.post('/users.json' + '?auth=' + state.idToken, userData)
      .then(response => console.log(response))
      .catch(error => console.log(error))
    },
    fetchUser ({commit, state}) {
      console.log('state', state)
      if (!state.idToken) {
        return
      }
      globalAxios.get('/users.json' + '?auth=' + state.idToken)
      .then(response => {
        console.log(response)
        const data = response.data
        const users = []
        for (let key in data) {
          const user = data[key]
          user.id = key
          users.push(user)
        }
        console.log(users)
        commit('storeUser', users[0])
      })
      .catch(error => console.log(error))
    }
  },
  getters: {
    user(state) {
      return state.user
    },
    isAuthenticated (state) {
      return state.idToken !== null 
    }
  }
})