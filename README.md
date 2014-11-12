# GIT 사용하기
## clone
### ssh 방법
장단점
* clone, pull 할 때 계정정보 입력하지 않다도 됨
* private key를 설정하는게 약간 까다로움
id_rsa에 private key 입력
```
vi ~/.ssh/id_rsa
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAwQB (생략)  +ZozyEo
-----END RSA PRIVATE KEY-----
```
clone 명령 발행
`git clone git@github.com:grollcake/dev-nory.git`
### https 방법
`git clone https://github.com/grollcake/dev-nory.git`
## commit
```
git add *
git commit -m '어쩌구 저쩌구'
git push
```
## 업데이트
```
git pull
```
