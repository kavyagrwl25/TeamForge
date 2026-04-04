const AsyncHandler = (controllerFun) => {
    return (req, res, next) => {
        Promise.resolve(controllerFun(req, res, next)).catch(next);    
    };
};

export { AsyncHandler }
