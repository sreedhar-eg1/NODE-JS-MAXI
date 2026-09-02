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

    type AuthData {
        token: String!
        userId: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String
    }

    type Query {
        login(email: String!, password: String!): AuthData
    }

    type Mutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post
    }
  `,
  resolvers: resolvers
});