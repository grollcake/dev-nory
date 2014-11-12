# GIT 사용하기

## clone

### ssh 방법

* clone, pull 할 때 계정정보 입력하지 않아도 됨
* private key를 ~/.ssh/id_rsa에 미리 설정해야 함

id_rsa에 private key 입력

```
vi ~/.ssh/id_rsa
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAwQB (생략)  +ZozyEo
-----END RSA PRIVATE KEY-----
```

> 명령어

`git clone git@github.com:grollcake/dev-nory.git`

### https 방법

* push 할 때마다 계정정보를 입력하기 때문에 보안성은 향상되지만 불편은 가중됨

> 명령어

`git clone https://github.com/grollcake/dev-nory.git`

## commit

> 명령어

```
git add *
git commit -m '어쩌구 저쩌구'
git push
```

## 업데이트

원격지 서버의 최종분을 로컬에 반영한다.

> 명령어

```
git pull
```
