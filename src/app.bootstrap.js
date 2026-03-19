
import { EMAIL_USER, NODE_ENV, port } from '../config/config.service.js'
import { authRouter, messageRouter, userRouter } from './modules/index.js'
import express from 'express'
import {connectdb, connectRedis, redisClient} from './DB/index.js'
import cors from 'cors'
import helmet from 'helmet'
import { resolve } from "node:path";
import { set } from './common/services/redis.services.js'
import { sendEmail } from './utils/email/send.email.js'
import {ipKeyGenerator, rateLimit} from 'express-rate-limit'
import axios from 'axios'
import geoip from 'geoip-lite'
async function bootstrap() {
    const app = express()
    const fromWhere = async(ip)=>{
        try {
       const response = await axios.get(`https://ipapi.co/${ip}/json`);
       console.log(response.data);
       return response.data
       } catch (error) {
       console.error(error);
}
    }
    //convert buffer data
    /*var corsOptions={
        origin:[]
        optionSuccessStatus:200
    }*/
    const limiter=rateLimit({
        windowMs:2*60*1000,
        limit:async function(req){
          //const {country_code} = await fromWhere(req.ip) ||{}
            //console.log(country_code);
            console.log(geoip.lookup(req.ip));
            const geo = geoip.lookup(req.ip);
            const country = geo ? geo.country : "EG";
            return country==="EG"? 5:1
        },
        //message:"no more req"
        legacyHeaders:true,
        standardHeaders:"draft-8",
        handler:(req,res,next)=>{
            return res.status(429).json({message:"too many req"})
        },
        keyGenerator:(req,res,next)=>{
            //console.log(req.headers['x-forwarded-for']);
            
            const ip =ipKeyGenerator(req.ip,56)
            console.log(`${ip}-${req.path}`);
            return `${ip}-${req.path}`
        },
        store: {
    async incr(key, cb) { // get called by keyGenerator
        try {
            const count = await redisClient.incr(key);
            if (count === 1) await redisClient.expire(key, 60); // 1 min TTL
            cb(null, count);
        } catch (err) {
            cb(err);
        }
    },

    async decrement(key) { // called by skipFailedRequests:true , skipSuccessfulRequests:true,
        if (await redisClient.exists(key)) {
            await redisClient.decr(key);
        }
    }
}
    })
    app.set("trust proxy",true)
    app.use(cors(),helmet(),limiter,express.json())
    app.use("/uploads",express.static(resolve("./uploads")))
    app.use(express.urlencoded({ extended: true }));
    await connectdb();
    await connectRedis()



    await set({key:"name",value:{username:"elwan"}})
    //application routing
    app.get('/', async(req, res) =>{
        console.log(await fromWhere(req.ip));
        
         res.send('Hello World!')})

    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/message', messageRouter)

    //invalid routing
    app.use('{/*dummy}', (req, res) => {
        return res.status(404).json({ message: "Invalid application routing" })
    })

    //error-handling
    app.use((error, req, res, next) => {
        const status = error.cause?.status ?? 500
        return res.status(status).json({
            error_message:
                status == 500 ? 'something went wrong' : error.message ?? 'something went wrong',
            stack: NODE_ENV == "development" ? error.stack : undefined
        })
    })
    
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
export default bootstrap
