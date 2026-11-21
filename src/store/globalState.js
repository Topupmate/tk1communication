import { createSlice } from '@reduxjs/toolkit';

import { BaseUrl } from './apis/api';

// Dev-only: prints a copy-paste ready header for Postman/curl. Never runs in
// a production build, where logging a bearer token would be a leak.
const logAuthToken = (token) => {
  if (typeof __DEV__ === 'undefined' || !__DEV__ || !token) return;

  /* eslint-disable no-console */
  console.log('[Auth] ===== POSTMAN =====');
  console.log(`[Auth] Base URL: ${BaseUrl}`);
  console.log(`[Auth] Authorization: Bearer ${token}`);
  console.log(`[Auth] curl -H "Authorization: Bearer ${token}" ${BaseUrl}profile`);
  console.log('[Auth] ===================');
  /* eslint-enable no-console */
};

const initialState = {
  isModalVisible: false,
  dataModel: false,
  user: null,
  isAuthenticated: false,
  token: '',
  user: '',
  netWorkSettings: [],
  dataPlans: [],
  contact: {},
  airtimeNetWorkStatus: {},
  dataNetworkStatus: {},
  siteSettings: {},
  hasShowNotification: false,
  features: null,
  cashbackSettings: null,
};

const globalSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    toggleModal: (state) => {
      state.isModalVisible = state.isModalVisible ? false : true;
    },
    toggleDataModel: (state) => {
      state.dataModel = state.dataModel ? false : true;
    },
    loginUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
      logAuthToken(action.payload.token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.features = null;
      state.cashbackSettings = null;
    },
    useContact: (state, action) => {
      state.contact = action.payload;
    },
    setContact: (state, action) => {
      state.netWorkSettings = action.payload;
    },
    setDataPlans: (state, action) => {
      state.dataPlans = action.payload;
    },
    setContactNumber: (state, action) => {
      state.contact = action.payload;
    },
    resetContactNumber: (state) => {
      state.contact = {};
    },
    setAirtimeNetwork: (state, action) => {
      state.airtimeNetWorkStatus = action.payload;
    },
    setDataNetwork: (state, action) => {
      state.dataNetworkStatus = action.payload;
    },
    saveSiteSettings: (state, action) => {
      state.siteSettings = action.payload;
    },
    setHasShowNotification: (state, action) => {
      state.hasShowNotification = true;
    },
    setFeatures: (state, action) => {
      state.features = action.payload;
    },
    setCashbackSettings: (state, action) => {
      state.cashbackSettings = action.payload;
    },
  },
});

export const {
  toggleModal,
  toggleDataModel,
  loginUser,
  logout,
  useContact,
  setContact,
  setDataPlans,
  resetContactNumber,
  setContactNumber,
  setAirtimeNetwork,
  setDataNetwork,
  saveSiteSettings,
  setHasShowNotification,
  setFeatures,
  setCashbackSettings,
} = globalSlice.actions;
export default globalSlice.reducer;
