const { createSchema } = require("graphql-yoga");
const resolvers = require("./resolvers");

module.exports = createSchema({
  typeDefs: `
    type Post {
        _id: ID!
        title: String!
        Content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type Query {
        hello: String
    }

    type Mutation {
        createUser(userInput: UserInputData): User!
    }
  `,
  resolvers: resolvers
});