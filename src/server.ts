import initApp from "./index";

const PORT: number = Number(process.env.PORT);

initApp().then((app) => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
