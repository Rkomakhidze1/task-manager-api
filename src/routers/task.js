const Task = require('../models/task')
const express = require('express')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    try {
        const task = await new Task({
            ...req.body,
            owner: req.user._id
        }).save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        console.log(req.query.sortBy.split('_'))
        const arr = req.query.sortBy.split('_')
        sort[arr[0]] = arr[1] === 'acs' ? 1 : -1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            },
        }).execPopulate()
        if (req.user.tasks.length === 0) return res.send('there are no tasks yet')

        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) return res.status(404).send()
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedToUpdate = ["description", "completed"]
    const updatesArr = Object.keys(req.body)
    const checkIfValidUpdate = updatesArr.every(update => allowedToUpdate.includes(update))

    if (!checkIfValidUpdate) return res.status(400).send("prop does not exist")

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) return res.status(404).send('cannot find task');

        updatesArr.forEach(update => task[update] = req.body[update]);
        await task.save()
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e)
    }
})


router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) return res.status(404).send()
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router