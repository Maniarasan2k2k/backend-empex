import React from "react";
import { createRoot } from "react-dom/client";
import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "state";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "state/api";
import { auditLogsAPI } from "state/auditLogsAPI";

import App from "./App";

import "./index.css";

// Redux Store
const store = configureStore({
  reducer: {
    global: globalReducer,
    [api.reducerPath]: api.reducer,
    [auditLogsAPI.reducerPath]: auditLogsAPI.reducer,
  },
  middleware: (getDefault) =>
    getDefault()
      .concat(api.middleware)
      .concat(auditLogsAPI.middleware),
});
setupListeners(store.dispatch);

// Rendering App
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
