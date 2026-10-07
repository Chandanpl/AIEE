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

        stage('Verify Kubernetes') {
            steps {
                bat 'kubectl get nodes'
                bat 'kubectl get pods -n aiee'
            }
        }
    }

    post {
        success {
            echo 'AIEE CI pipeline completed successfully.'
        }

        failure {
            echo 'AIEE CI pipeline failed. Check the stage logs.'
        }
    }
}