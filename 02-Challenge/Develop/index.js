const express = require('express');
const mongoose = require('mongoose');
        require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const reactionSchema = new mongoose.Schema({
    reactionId: {
        type: mongoose.Types.ObjectId,
        default: new mongoose.Types.ObjectId(),
    },
    reactionBody: {
        type: String,
        required: true,
        maxLength: 280
    },
    username: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

const thoughtSchema = new mongoose.Schema({
    thoughtText: {
        type: String,
        required: true,
        maxLength: 280
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    username: {
        type: String,
        required: true
    },
    reactions: [reactionSchema]
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    thoughts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Thought'}],
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

thoughtSchema.virtual('reactionCount').get(() => {
    return this.reactions.length;
});

const User = mongoose.model('User', userSchema);
const Thought = mongoose.model('Thought', thoughtSchema);

app.get('/api/users', (req, res) => {
    res.status(200).send(User.find({}));
});

app.get('/api/users/:id', (req, res) => {
    res.status(200).send(User.findById(req.params.id));
});

app.post('/api/users/create', async (req, res) => {
    const user = await User.create(req.body);
    res.status(200).send(user);
});

app.post('/api/users/:userId/friends/:friendId', (req, res) => {
    const friend = User.findOne(
        {'_id': req.params.userId},
        {$pull: { friends: {_id: req.params.friendId}}}
    );
    res.status(200).send(friend);
})

app.get('/api/thoughts', (req, res) => {
    res.status(200).send(Thought.find({}));
});

app.get('/api/thoughts/:thoughtId/reactions', (req, res) => {
    res.status(200).send(Thought.findById(req.params.id).reactions);
});


app.listen(PORT, async () => {
    console.log('connecting to mongodb...');
    const dburl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/';
    await mongoose.connect(dburl);

    console.log('connected to mongodb');
});
