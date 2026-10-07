pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                bat '"C:\\Users\\LENOVO\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" --version'
                bat 'kubectl version --client'
            }
        }

        stage('Build Backend Image') {
            steps {
                bat '"C:\\Users\\LENOVO\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" build -f Dockerfile.backend -t aiee-backend:jenkins .'
            }
        }

        stage('Build Frontend Image') {
            steps {
                bat '"C:\\Users\\LENOVO\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" build -t aiee-frontend:jenkins .\\dashboard'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl set image deployment/aiee-backend backend=aiee-backend:jenkins -n aiee'
                bat 'kubectl set image deployment/aiee-frontend frontend=aiee-frontend:jenkins -n aiee'

                bat 'kubectl rollout status deployment/aiee-backend -n aiee'
                bat 'kubectl rollout status deployment/aiee-frontend -n aiee'

                bat 'kubectl get pods -n aiee'
            }
        }
    }

    post {
        success {
            echo 'AIEE CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'AIEE CI/CD pipeline failed. Check the stage logs.'
        }
    }
}// Automatic Jenkins trigger test