pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        // https://github.com/DeepakDevProjects/meta-keyword-extract
        GITHUB_REPO = 'DeepakDevProjects/meta-keyword-extract'
        SPREADSHEET_ID = '1u_6w8LhMj-zg8qQxg71zNRmdzdbVPDm1UKDNj_9IAtg'
        GOOGLE_CREDENTIALS = credentials('google-sheets-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }
        
        // stage('Setup Node.js') {
        //     steps {
        //         echo 'Setting up Node.js environment...'
        //         sh '''
        //             # Install Node.js if not available
        //             if ! command -v node &> /dev/null; then
        //                 echo "Installing Node.js..."
        //                 curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        //                 sudo apt-get install -y nodejs
        //             fi
                    
        //             # Check Node.js version
        //             node --version
        //             npm --version
        //         '''
        //     }
        // }

        stage('Setup Node.js') {
            steps {
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm install 20
                    nvm use 20
                    node -v
                    npm -v
                '''
            }
        }

        
        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm use 20
                    npm install
                '''
            }
        }
        
        stage('Build TypeScript') {
            steps {
                echo 'Building TypeScript code...'
                sh '''
                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm use 20
                    npm run build
                '''
            }
        }
        
        stage('Extract Meta Keywords') {
            steps {
                echo 'Running alphabetical counting automation...'
                script {
                    withCredentials([file(credentialsId: 'google-sheets-credentials', variable: 'GOOGLE_CREDS')]) {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                            nvm use 20
                            export GOOGLE_APPLICATION_CREDENTIALS="$GOOGLE_CREDS"
                            export SPREADSHEET_ID="$SPREADSHEET_ID"
                            npm start
                        '''
                    }
                }
            }
        }
        
        stage('Verify Results') {
            steps {
                echo 'Verifying the results...'
                sh '''
                    echo "Checking if the script executed successfully..."
                    if [ -f "dist/index.js" ]; then
                        echo "✅ TypeScript build successful"
                    else
                        echo "❌ TypeScript build failed"
                        exit 1
                    fi
                '''
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo '🎉 Pipeline completed successfully!'
            echo 'Alphabetical counting has been updated in the Google Spreadsheet.'
        }
        failure {
            echo '❌ Pipeline failed!'
            echo 'Check the logs for more details.'
        }
    }
}
