package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (
	router = gin.Default()
)

type Response struct {
	Message string `json:"message"`
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	router.POST("/", Home)
	log.Fatal(router.Run(":8080"))
}
func Home(c *gin.Context) {
	tokenAuth, err := ExtractTokenMetadata(c.Request)
	if err != nil {
		c.JSON(http.StatusUnauthorized, "unauthorized")
		return
	}
	expired, err := hasExpired(tokenAuth.User.Username)
	if err == nil {
		if expired {
			c.JSON(403, Response{Message: "Token has expired. Please login again"})
		} else {
			c.JSON(200, tokenAuth.User.Username)
		}
	} else {
		log.Fatal(err)
		c.JSON(500, Response{Message: "An error occured while fetching the token from Redis"})
	}
}
