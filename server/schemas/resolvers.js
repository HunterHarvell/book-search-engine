const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
                return userData;
            }
            throw new AuthenticationError('You are not logged in.');
        },
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user found');
            }

            const correctPW = await user.isCorrectPassword(password);

            if (!correctPW) {
                throw new AuthenticationError('Wrong Password');
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: newBook }},
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You are not logged in.');
        },
        removeBook: async (parent, { bookID }, context) => {
            if (context.user) {
                const updatedUser = await User.findeByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookID }}},
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You are not logged in.');
        }
    }
};

module.exports = resolvers;