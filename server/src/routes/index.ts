import { Router } from "express";
import logRoute from "./log.route.js";

const router = Router();

interface IRoute {
    path: string;
    route: Router;
}

const defaultRoutes: IRoute[] = [
    {
        path: "/",
        route: logRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;