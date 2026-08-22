import "@/styles/global.css";

const appRoot = document.getElementById("root");

if (appRoot == null) {
    throw new Error("Application root was not found");
}

void import("@/entries/dashboard-client").then(({ mountDashboardClient }) => {
    mountDashboardClient(appRoot);
});
