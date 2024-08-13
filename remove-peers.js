const exec = require("child_process").execSync;

const libraryPackageJson = require("./projects/ngx-ute-core/package.json");
const excludes = ["@capacitor/preferences"];

if (libraryPackageJson.devDependencies) {
    Object.keys(libraryPackageJson.devDependencies).forEach((dep) => {
        if (!excludes.some((ex) => ex === dep)) {
            console.log(`Remove: ${dep}`);
            exec(`npm r ${dep}`);
        }
    });
}
