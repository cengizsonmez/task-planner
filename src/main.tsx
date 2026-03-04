import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import 'antd/dist/reset.css'
import { Provider } from "react-redux";
import { AppProviders } from "./app/AppProviders";
import { store } from "./app/store.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppProviders>
        <App />
      </AppProviders>
    </Provider>
  </StrictMode>,
);
