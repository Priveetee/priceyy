package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		fmt.Println("Go API is running with database configuration.")
	} else {
		fmt.Println("Go API is running but database URL is not set.")
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "API is running!")
	})

	log.Println("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
