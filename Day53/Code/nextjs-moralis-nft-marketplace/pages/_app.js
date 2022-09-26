import '../styles/globals.css'
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <Header />
      <Component {...pageProps} />
    </MoralisProvider>
  )
}

export default MyApp
