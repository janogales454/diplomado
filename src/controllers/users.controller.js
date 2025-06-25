import {User} from '../models/user.js';
import {Task} from '../models/task.js';
import { Status, userLimit, userOrderBy, userOrderDir } from '../constants/index.js';
import { encriptar } from '../common/bcrypt.js';
import logger from '../logs/logger.js';
import { Op } from 'sequelize';

async function getUsers(req, res, next) {
    try{
        const users = await User.findAll({
            attributes: ['id','username','password','status'],
            order: [['id','DESC']],
            where:{
                status: Status.ACTIVE
            }
        });
        res.json(users);
    }catch(error){
        next(error);
    }
}

async function createUser(req, res, next) {
    const { username, password } = req.body;
    try{
        
        const passwordEnc = await encriptar(password);
        const user = await User.create({
            username: username, 
            password: passwordEnc
        });
        res.json(user);
    }catch(error){
        next(error);
    }
}


async function getUser(req, res, next) {
    const { id } = req.params;
    try{
        //const user = await User.findByPk(id);
        const user = await User.findOne({
            attributes: ['username','status'],
            where: {
                id: id
            }
        });
        if(!user){
            res.status(404).json({message:'User Not Found'});
        }
        res.json(user);
    }catch(error){
        next(error);
    }
}



async function updateUser(req, res, next) {
    const { id } = req.params;
    const { username, password } = req.body;
    try{
        if(!username || !password){
            res.status(404).json({message:'Username or Password is required'});
        }
        const passwordEnc = await encriptar(password);
        const user = await User.update({
            username: username,
            password: passwordEnc
        }, {
            where:{
                id:id
            }
        });
        
        if(user[0] === 0){
            res.status(404).json({message:'User not found'});
        }
        res.json(user);
    }catch(error){
        next(error);
    }
}

async function deleteUser(req, res, next) {
    const { id } = req.params;
    try{
        const user = await User.destroy({
            where:{
                id:id
            }
        });
        if(user === 0){
            res.status(404).json({message:'User not found'});
        }
        res.status(204).json({ message: 'User deleted'});
    }catch(error){
        next(error);
    }
}

async function activateInactivate(req, res, next) {
    const { id } = req.params;
    const { status } = req.body;
    try{
        if(!status){
            res.status(400).json({ message: 'Status is required'});
        }
        const user = await User.findByPk(id);
        if(!user){
            res.status(400).json({ message: 'User not found'});
        }
        if(user.status === status){
            res.status(400).json({ message: 'Same status'});
        }
        user.status = status;
        await user.save();
        res.json(user);
    }catch(error){
        next(error);
    }
}


async function getTasks(req, res, next) {
    const { id } = req.params;
    try{
        const user = await User.findOne({
            attributes: ['username'],
            include:[
                {
                    model:Task,
                    attributes:['name','done'],
                    where:{
                        done:false
                    }
                }
            ],
            where:{
                id:id
            }
        });
        res.json(user);
    }catch(error){
        next(error);
    }
}


async function getUserPagination(req, res, next) {
    try{
        let { page, limit, search, orderBy, orderDir } = req.query;
        if(!page){
            page = '1';
        }
        if(isNaN(page)){
            res.status(400).json({ message: 'Invalid input for page'});
        }
        page = parseInt(page);
        if(page < 1){
            res.status(400).json({ message: 'Invalid input for page'});
        }
        if(!limit){
            limit = userLimit.TEN;
        }
        if(limit !== userLimit.FIVE && limit !== userLimit.TEN && limit !== userLimit.FIFTEEN && limit !== userLimit.TWENTY){
            res.status(400).json({ message: 'Invalid input for Limit'});
        }
        if(!orderBy){
            orderBy = userOrderBy.ID;
        }
        if(orderBy !== userOrderBy.ID && orderBy !== userOrderBy.USERNAME && orderBy !== userOrderBy.STATUS){
            res.status(400).json({ message: 'Invalid input for orderBy'});
        }
        if(!orderDir){
            orderDir = userOrderDir.DESC;
        }
        if(orderDir !== userOrderDir.ASC && orderDir !== userOrderDir.DESC){
            res.status(400).json({ message: 'Invalid input for orderDir'});
        }
        let where = {};
        if(search){
            where = {
                username: { [Op.like]: `%${search}%`}
            }
        }

        const users = await User.findAndCountAll({
            attributes: ['id','username','status'],
            order: [[orderBy,orderDir]],
            limit: limit,
            offset: (page - 1),
            where: where
        });
        const resCount = users.count;
        let result = {};
        result.total = users.count;
        result.page = page;
        result.pages = Math.ceil(users.count / parseInt(limit));
        result.data = users.rows;
        res.json(result);
    }catch(error){
        next(error);
    }
}


export default {
    getUsers,
    createUser,
    getUser,
    activateInactivate,
    updateUser,
    deleteUser,
    getTasks,
    getUserPagination
};