import { Task } from "../models/task.js";

async function getTasks(req, res, next) {
    const {userId} = req.user;
    try{
        const tasks = await Task.findAll({
            attributes:['id', 'name', 'done'],
            order: [['name','ASC']],
            where:{
                userId:userId
            }
        });
        res.json(tasks);
    }catch(error){
        next(error);
    }
}

async function createTask(req, res, next) {
    const {userId} = req.user;
    const {name} = req.body;
    try{
        const task = await Task.create({
            name: name,
            userId: userId,
        });
        res.json(task);
    }catch(error){
        next(error);
    }
}

async function getTask(req, res, next) {
    const {id} = req.params;
    const {userId} = req.user;
    try{
        const tasks = await Task.findOne({
            attributes:['id', 'name', 'done'],
            where:{
                id: id,
                userId: userId,
            }
        });
        if(!tasks){
            res.status(404).json({message: 'Task not found'});
        }
        res.json(tasks);
    }catch(error){
        next(error);
    }
}

async function updateTask(req, res, next) {
    const {id} = req.params;
    const {name} = req.body;
    const {userId} = req.user;
    try{
        const tasks = await Task.update({
            name:name
        }, {
            where:{
                id: id,
                userId: userId
            }
        });
        if(tasks[0] === 0){
            res.status(404).json({message:'Task not found'});
        }
        res.json(tasks);
    }catch(error){
        next(error);
    }
}


async function taskDone(req, res, next) {
    const {id} = req.params;
    const {userId} = req.user;
    const { done } = req.body;
    try{
        const tasks = await Task.update({
            done: done
        }, {
            where:{
                id: id,
                userId: userId
            }
        });
        if(tasks[0] === 0){
            res.status(404).json({message:'Task not found'});
        }
        res.json(tasks);
    }catch(error){
        next(error);
    }
}


async function deleteTask(req, res, next) {
    const {id} = req.params;
    const {userId} = req.user;
    try{
        const tasks = await Task.destroy({
            where:{
                id: id,
                userId: userId
            }
        });
        if(tasks === 0){
            res.status(404).json({message:'Task not found'});
        }
        res.json({message:'Task deleted'});
    }catch(error){
        next(error);
    }
}


export default {
    getTasks,
    createTask,
    getTask,
    updateTask,
    taskDone,
    deleteTask
}
