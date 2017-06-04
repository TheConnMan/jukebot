docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD";
VERSION=`node -e "console.log(require('./package.json').version);"`;
if [ "$TRAVIS_BRANCH" != "master" ]; then
  sed -i "s/$VERSION/$VERSION-${TRAVIS_COMMIT}/g" package.json;
fi
docker build -t theconnman/jukebot .;
if [ "$TRAVIS_BRANCH" == "master" ]; then
  docker tag theconnman/jukebot theconnman/jukebot:$VERSION;
  docker push theconnman/jukebot:latest;
  docker push theconnman/jukebot:$VERSION;
elif [ "$TRAVIS_BRANCH" == "dev" ]; then
  docker tag theconnman/jukebot theconnman/jukebot:latest-dev;
  docker push theconnman/jukebot:latest-dev;
else
  docker tag theconnman/jukebot theconnman/jukebot:${TRAVIS_BRANCH#*/};
  docker push theconnman/jukebot:${TRAVIS_BRANCH#*/};
fi
