package main

import (
	"log"
	"os"

	"github.com/go-redis/redis"
)

var client *redis.Client

func init() {
	//Initializing redis
	dsn := os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT")
	if len(dsn) == 1 {
		dsn = "localhost:6379"
	}
	client = redis.NewClient(&redis.Options{
		Addr: dsn, //redis port
	})
	_, err := client.Ping().Result()
	if err != nil {
		log.Fatal("Could not connect to Redis... Exiting.")
		panic(err)
	}
}
func hasExpired(username string) (bool, error) {
	result, err := client.Exists(username).Result()
	if err != nil {
		log.Fatal("Error while fetching data from Redis", err)
		return true, err
	} else {
		return result == 0, nil
	}
}
