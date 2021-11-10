import { gql } from 'apollo-boost';

export const ARTISTS_QUERY = gql`
  query artists($address: Bytes!) {
    artists(where: { address: $address }) {
      inkCount
      address
      inks(orderBy: createdAt, orderDirection: desc) {
        inkNumber
        jsonUrl
        limit
        count
        createdAt
        sales {
          price
        }
      }
    }
  }
`;


export const INKS_QUERY = gql`
  query inks {
    inks(first: 5) {
      id
      inkNumber
      jsonUrl
    }
  }
`;

export const INK_QUERY = gql`
query ink($inkUrl: String!) {
  ink(id: $inkUrl) {
    id
    inkNumber
    jsonUrl
    artist {
      id
    }
    limit
    count
    mintPrice
    mintPriceNonce
    tokens {
      id
      owner
      network
      price
    }
  }
}
`;

export const SUMMARY_QUERY = gql`
query artists($address: Bytes!) {
    artists(where: { address: $address }) {
    inkCount
    address
    inks(orderBy: createdAt, orderDirection: desc) {
      inkNumber
      jsonUrl
      limit
      count
      createdAt
      sales {
        price
      }
    }
  }
  tokens(where: { owner: $address }) {
    id
  }
}
`;

export const ALL_INKS_QUERY = gql`
query allinks($first: Int, $skip: Int)
{
  inks(first: $first, skip: $skip, orderBy: inkNumber, orderDirection: desc) {
    id
    jsonUrl
  }
}`
