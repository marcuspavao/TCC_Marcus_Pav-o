import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloProvider, ApolloClient, InMemoryCache} from '@apollo/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Create a WebSocket link:
const link = new WebSocketLink({
  uri: process.env.REACT_APP_WS_URL_LOCAL,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": process.env.REACT_APP_WS_SECRET
      }
    }
  }
})

const cache = new InMemoryCache();
const client = new ApolloClient({
  link,
  cache
});

root.render(
    <ApolloProvider client={client}> 
      <App />
    </ApolloProvider>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
