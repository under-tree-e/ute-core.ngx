const exec = require("child_process").execSync;

const libraryPackageJson = require("./projects/ngx-ute-core/package.json");

if (libraryPackageJson.devDependencies) {
    Object.keys(libraryPackageJson.devDependencies).forEach((dep) => {
        console.log(`Install DEV: ${dep}`);
        exec(`npm i -D ${dep}@${libraryPackageJson.devDependencies[dep]}`, { stdio: "inherit" });
    });
}
