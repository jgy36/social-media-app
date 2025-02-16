import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react"; // ✅ Import NextAuth session provider
import { store } from "@/redux/store";
import "@/styles/globals.css";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      {" "}
      {/* ✅ Wrap with SessionProvider */}
      <Provider store={store}>
        {" "}
        {/* ✅ Redux Provider */}
        <Component {...pageProps} />
      </Provider>
    </SessionProvider>
  );
}

export default MyApp;
