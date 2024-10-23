import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

app.get('/login', (req, res) => {
    res.send("GOTCHA")
})

app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
            id: 1,
            title: "joke-1",
            content: "What is your joke?"
        },
        {
            id: 2,
            title: "joke-2",
            content: "What is your joke-2?"
        },
        {
            id: 3,
            title: "joke-3",
            content: "What is your joke-3?"
        },
        {
            id: 4,
            title: "joke-4",
            content: "Where do you joke-4?"
        },
        {
            id: 5,
            title: "joke-5",
            content: "How is your joke-5?"
        }
    ]

    res.send(jokes);
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})