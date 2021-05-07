package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

var (
	router = gin.Default()
)

func main() {
	router.POST("/", Home)
	log.Fatal(router.Run(":8080"))
}
