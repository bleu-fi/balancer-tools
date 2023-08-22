import { gql } from "graphql-tag";

export const poolWhereOwner = gql`
  query PoolsWhereOwner($owner: Bytes!) {
    pools(where: { owner: $owner }) {
      poolType
      name
      id
      address
      tokens {
        symbol
        weight
      }
    }
  }
`;

export const poolWherePoolTypeInAndId = gql`
  query PoolsWherePoolTypeInAndId(
    $poolId: ID!
    $poolTypes: [String!] = [
      "Weighted"
      "ComposableStable"
      "Stable"
      "MetaStable"
      "Element"
      "LiquidityBootstrapping"
      "Linear"
      "GyroE"
    ]
  ) {
    pools(
      where: { poolType_in: $poolTypes, id: $poolId, totalLiquidity_gt: 0 }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      address
      name
      poolType
      symbol
      totalLiquidity
      tokens {
        symbol
      }
    }
  }
`;

export const poolWherePoolType = gql`
  query PoolsWherePoolType(
    $poolTypes: [String!] = [
      "Weighted"
      "ComposableStable"
      "Stable"
      "MetaStable"
      "Element"
      "LiquidityBootstrapping"
      "Linear"
      "GyroE"
    ]
  ) {
    pools(
      where: { poolType_in: $poolTypes, totalLiquidity_gt: 0 }
      orderBy: totalLiquidity
      orderDirection: desc
      first: 1000
    ) {
      id
      address
      name
      poolType
      symbol
      totalLiquidity
      tokens {
        symbol
      }
    }
  }
`;

export const poolWhereBlockNumber = gql`
  query PoolWhereBlockNumber($blockNumber: Int!, $poolId: ID!) {
    pool(id: $poolId, block: { number: $blockNumber }) {
      id
      address
      name
      poolType
      symbol
      totalLiquidity
      tokens {
        symbol
      }
    }
  }
`;

export const poolsByTotalLiquidity = gql`
  query PoolsByTotalLiquidity($first: Int = 10, $poolIdList: [ID!]) {
    pools(
      where: { totalLiquidity_gt: 0, id_in: $poolIdList }
      orderBy: totalLiquidity
      orderDirection: desc
      first: $first
    ) {
      id
      address
      name
      poolType
      symbol
      totalLiquidity
    }
  }
`;

export const poolById = gql`
  query Pool($poolId: ID!) {
    pool(id: $poolId) {
      address
      owner
      poolType
      symbol
      swapFee
      totalLiquidity
      amp
      c
      s
      alpha
      beta
      sqrtAlpha
      sqrtBeta
      root3Alpha
      lambda
      tauAlphaX
      tauAlphaY
      tauBetaX
      tauBetaY
      delta
      epsilon
      u
      v
      w
      z
      dSq
      tokens {
        address
        symbol
        balance
        decimals
        priceRate
        token {
          fxOracleDecimals
          latestFXPrice
        }
      }
    }
  }
`;
