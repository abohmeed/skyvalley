package main

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

type User struct {
	Username string `json:"username"`
}

type AccessDetails struct {
	User User `json:"user"`
	jwt.StandardClaims
}

func ExtractToken(r *http.Request) string {
	bearToken := r.Header.Get("Authorization")
	strArr := strings.Split(bearToken, " ")
	if len(strArr) == 2 {
		return strArr[1]
	}
	return ""
}

func VerifyToken(r *http.Request) (*jwt.Token, error) {
	tokenString := ExtractToken(r)
	token, err := jwt.ParseWithClaims(tokenString, &AccessDetails{}, func(token *jwt.Token) (interface{}, error) {
		return []byte("0182feef69b9573d1d8397108bca3149dea631743ea0c6d9acbb7e34f608d475bb6f26ce27cdb1a527d19e89a96fbdd7ff9bc38eadd71f807c3d683d0c38168c"), nil
	})
	if err != nil {
		return nil, err
	}
	return token, nil
}
func ExtractTokenMetadata(r *http.Request) (*AccessDetails, error) {
	token, err := VerifyToken(r)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*AccessDetails)
	if !ok {
		return nil, errors.New("couldn't parse claims")
	}
	return claims, nil
}
func Home(c *gin.Context) {
	tokenAuth, err := ExtractTokenMetadata(c.Request)
	if err != nil {
		c.JSON(http.StatusUnauthorized, "unauthorized")
		return
	}
	fmt.Println(tokenAuth)
	c.JSON(200, tokenAuth.User.Username)
}
