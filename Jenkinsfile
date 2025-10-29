pipeline {
    agent any

    options {
        gitLabConnection('GitLab SSAFY')
    }

    environment {
        FRONTEND_DIR = "${env.WORKSPACE}/frontend/chub"
        FRONTEND_BUILD_DIR = "${FRONTEND_DIR}/dist"
        FRONTEND_DEPLOY_DIR = "/var/www/html"

        BACKEND_DIR = "${env.WORKSPACE}/backend"
        BACKEND_COMPOSE_FILE = "${BACKEND_DIR}/docker-compose.yml"

        BUILD_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('🔍 변경 감지') {
            steps {
                script {
                    updateGitlabCommitStatus name: 'build', state: 'running'

                    echo '=== Git 변경사항 확인 ==='

                    // 변경된 파일 목록 확인
                    def changes = sh(
                        script: 'git diff --name-only HEAD~1 HEAD || echo "all"',
                        returnStdout: true
                    ).trim()

                    echo "변경된 파일들:\n${changes}"

                    // 변경 여부 플래그 설정
                    env.FRONTEND_CHANGED = changes.contains('frontend/') ? 'true' : 'false'
                    env.BACKEND_CHANGED = changes.contains('backend/') ? 'true' : 'false'

                    // 첫 빌드이거나 변경사항이 없으면 모두 빌드
                    if (changes == 'all') {
                        env.FRONTEND_CHANGED = 'true'
                        env.BACKEND_CHANGED = 'true'
                    }

                    echo "=== 변경 감지 결과 ==="
                    echo "프론트엔드 변경: ${env.FRONTEND_CHANGED}"
                    echo "백엔드 변경: ${env.BACKEND_CHANGED}"
                }
            }
        }

        stage('💻 프론트엔드 빌드') {
            when {
                expression { env.FRONTEND_CHANGED == 'true' }
            }
            steps {
                echo '=== 프론트엔드 빌드 시작 ==='
                sh """
                    cd ${FRONTEND_DIR}

                    echo "Node.js 버전:"
                    node --version
                    npm --version

                    echo "의존성 설치..."
                    npm install

                    echo "프로덕션 빌드..."
                    npm run build

                    echo "빌드 결과 확인:"
                    ls -la ${FRONTEND_BUILD_DIR}/
                """
                echo '✅ 프론트엔드 빌드 완료'
            }
        }

        stage('🐳 백엔드 빌드') {
            when {
                expression { env.BACKEND_CHANGED == 'true' }
            }
            steps {
                echo '=== 백엔드 Docker 이미지 빌드 ==='
                withCredentials([
                    string(credentialsId: 'db-username', variable: 'DB_USERNAME'),
                    string(credentialsId: 'db-password', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'jwt-secret-key', variable: 'JWT_SECRET_KEY'),
                    string(credentialsId: 'kakao-client-id', variable: 'KAKAO_CLIENT_ID'),
                    string(credentialsId: 'kakao-client-secret', variable: 'KAKAO_CLIENT_SECRET'),
                    string(credentialsId: 'kakao-redirect-url', variable: 'KAKAO_REDIRECT_URL'),
                    string(credentialsId: 'gms-api-key', variable: 'GMS_API_KEY')
                ]) {
                    sh """
                        cd ${BACKEND_DIR}

                        echo "기존 컨테이너 중지..."
                        docker-compose -f ${BACKEND_COMPOSE_FILE} down || true

                        echo "Docker 이미지 빌드 시작..."
                        docker-compose -f ${BACKEND_COMPOSE_FILE} build --no-cache backend

                        echo "빌드된 이미지 확인:"
                        docker images | grep chub
                    """
                }
                echo '✅ 백엔드 빌드 완료'
            }
        }

        stage('🚀 프론트엔드 배포') {
            when {
                allOf {
                    expression { env.FRONTEND_CHANGED == 'true' }
                    anyOf {
                        branch 'develop'
                        expression {
                            // detached HEAD 상태에서도 develop 브랜치인지 확인
                            def currentBranch = sh(script: 'git branch -r --contains HEAD | grep origin/develop', returnStdout: true).trim()
                            return currentBranch.contains('origin/develop')
                        }
                    }
                }
            }
            steps {
                echo '=== 프론트엔드 배포 시작 ==='
                sh """
                    echo "기존 파일 백업..."
                    cp -r ${FRONTEND_DEPLOY_DIR} ${FRONTEND_DEPLOY_DIR}.backup.${BUILD_TAG} || true

                    echo "새 파일 배포..."
                    rsync -avz --delete ${FRONTEND_BUILD_DIR}/ ${FRONTEND_DEPLOY_DIR}/

                    echo "파일 권한 설정..."
                    chmod -R 755 ${FRONTEND_DEPLOY_DIR}

                    echo "배포 완료 확인:"
                    ls -la ${FRONTEND_DEPLOY_DIR}/ | head -10
                """
                echo '✅ 프론트엔드 배포 완료'
            }
        }

        stage('🐳 백엔드 배포') {
            when {
                allOf {
                    expression { env.BACKEND_CHANGED == 'true' }
                    anyOf {
                        branch 'develop'
                        expression {
                            // detached HEAD 상태에서도 develop 브랜치인지 확인
                            def currentBranch = sh(script: 'git branch -r --contains HEAD | grep origin/develop', returnStdout: true).trim()
                            return currentBranch.contains('origin/develop')
                        }
                    }
                }
            }
            steps {
                echo '=== 백엔드 Docker Compose 실행 ==='
                withCredentials([
                    string(credentialsId: 'db-username', variable: 'DB_USERNAME'),
                    string(credentialsId: 'db-password', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'jwt-secret-key', variable: 'JWT_SECRET_KEY'),
                    string(credentialsId: 'kakao-client-id', variable: 'KAKAO_CLIENT_ID'),
                    string(credentialsId: 'kakao-client-secret', variable: 'KAKAO_CLIENT_SECRET'),
                    string(credentialsId: 'kakao-redirect-url', variable: 'KAKAO_REDIRECT_URL'),
                    string(credentialsId: 'gms-api-key', variable: 'GMS_API_KEY')
                ]) {
                    sh """
                        cd ${BACKEND_DIR}

                        echo "Docker Compose로 컨테이너 시작..."
                        docker-compose -f ${BACKEND_COMPOSE_FILE} up -d

                        echo "컨테이너 상태 확인..."
                        docker-compose -f ${BACKEND_COMPOSE_FILE} ps

                        echo "백엔드 로그 확인 (10초 대기)..."
                        sleep 10
                        docker logs chub-backend --tail 50
                    """
                }
                echo '✅ 백엔드 배포 완료'
            }
        }

        stage('🏥 헬스체크') {
            when {
                anyOf {
                    branch 'develop'
                    expression {
                        // detached HEAD 상태에서도 develop 브랜치인지 확인
                        def currentBranch = sh(script: 'git branch -r --contains HEAD | grep origin/develop', returnStdout: true).trim()
                        return currentBranch.contains('origin/develop')
                    }
                }
            }
            steps {
                echo '=== 서비스 헬스체크 시작 ==='

                script {
                    if (env.FRONTEND_CHANGED == 'true') {
                        echo '프론트엔드 헬스체크...'
                        sh '''
                            for i in {1..5}; do
                                if curl -f -s http://localhost > /dev/null; then
                                    echo "✅ 프론트엔드 정상 응답 ($i/5)"
                                    break
                                fi
                                echo "⏳ 프론트엔드 응답 대기 중... ($i/5)"
                                sleep 3
                            done
                        '''
                    } else {
                        echo '프론트엔드 변경 없음 - 헬스체크 스킵'
                    }

                    if (env.BACKEND_CHANGED == 'true') {
                        echo '백엔드 헬스체크...'
                        sh '''
                            for i in {1..10}; do
                                if curl -f -s http://localhost:8080/api/health > /dev/null; then
                                    echo "✅ 백엔드 정상 응답 ($i/10)"
                                    curl -s http://localhost:8080/api/health | head -5
                                    break
                                fi
                                echo "⏳ 백엔드 응답 대기 중... ($i/10)"
                                sleep 5
                            done
                        '''
                    } else {
                        echo '백엔드 변경 없음 - 헬스체크 스킵'
                    }
                }
            }
        }
    }

    post {
        success {
            updateGitlabCommitStatus name: 'build', state: 'success'

            script {
                def deployedServices = []
                if (env.FRONTEND_CHANGED == 'true') deployedServices.add('프론트엔드')
                if (env.BACKEND_CHANGED == 'true') deployedServices.add('백엔드')

                def message = """
🎉 배포 성공!

빌드 번호: ${BUILD_NUMBER}
배포된 서비스: ${deployedServices.join(', ')}

접속 주소:
- 프론트엔드: https://chub.ai.kr
- 백엔드 API: https://chub.ai.kr:8080/api/health
- Swagger: https://chub.ai.kr:8080/swagger-ui.html
                """
                echo message
            }
        }

        failure {
            updateGitlabCommitStatus name: 'build', state: 'failed'

            echo """
❌ 배포 실패!

일반적인 해결 방법:
1. 빌드 오류: 로컬에서 빌드 테스트
2. Docker 오류: docker logs 확인
3. 환경변수 오류: .env 파일 확인
4. 디스크 용량: df -h로 용량 확인
            """

            // 실패 시 백업에서 복구 시도
            script {
                if (env.FRONTEND_CHANGED == 'true') {
                    sh """
                        if [ -d "${FRONTEND_DEPLOY_DIR}.backup.${BUILD_TAG}" ]; then
                            echo "프론트엔드 백업에서 복구 중..."
                            cp -r ${FRONTEND_DEPLOY_DIR}.backup.${BUILD_TAG}/* ${FRONTEND_DEPLOY_DIR}/ || true
                        fi
                    """
                }
            }
        }

        aborted {
            updateGitlabCommitStatus name: 'build', state: 'canceled'
        }

        always {
            echo '=== 정리 작업 ==='
            sh '''
                echo "디스크 사용량:"
                df -h

                echo "실행 중인 Docker 컨테이너:"
                docker ps

                echo "Docker 이미지 목록:"
                docker images | grep chub || echo "chub 이미지 없음"
            '''

            // 오래된 백업 파일 정리 (최근 3개만 유지)
            script {
                if (env.FRONTEND_CHANGED == 'true') {
                    sh """
                        cd ${FRONTEND_DEPLOY_DIR}/.. 2>/dev/null || true
                        ls -dt html.backup.* 2>/dev/null | tail -n +4 | xargs -r rm -rf || true
                    """
                }
            }
        }
    }
}
