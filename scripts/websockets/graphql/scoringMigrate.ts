import gql from "graphql-tag";

export const SCORING_MIGRATE = gql`
  mutation scoringMigrate($gameID: ID!) {
    scoringMigrate(gameID: $gameID) {
      id
    }
  }
`