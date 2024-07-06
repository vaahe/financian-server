import { spawn } from "child_process";

async function executeCommand(command: string) {
    return new Promise<void>((resolve, reject) => {
        const [cmd, ...args] = command.split(' ');
        const process = spawn(cmd, args, {
            shell: true,
            stdio: 'inherit'
        });

        process.stdout?.on('data', (data) => console.log(data.toString()));
        process.stderr?.on('data', (data) => console.error(data.toString()));

        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command "${command}" failed with exit code ${code}`));
            }
        });
    });
}

async function deploy() {
    try {
        // Step 1: Build the application
        await executeCommand('npm run build');

        // Setp 2: Install dependencies
        await executeCommand('npm i');

        // Step 3: Generate Prisma client
        await executeCommand('npm run prisma:generate');

        // Step 4: Apply database migrations
        await executeCommand('npm run prisma:migrate');

        // Step 5: Seed the database
        await executeCommand('npm run prisma:seed');

        // Step 6: Start the application
        await executeCommand('npm run dev');

        console.log('Application started');
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

deploy();