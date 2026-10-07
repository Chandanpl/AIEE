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
                bat 'docker --version'
                bat 'kubectl version --client'
            }
        }

        stage('Build Backend Image') {
            steps {
                bat 'docker build -f Dockerfile.backend -t aiee-backend:jenkins .'
            }
        }

        stage('Build Frontend Image') {
            steps {
                bat 'docker build -t aiee-frontend:jenkins .\\dashboard'
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