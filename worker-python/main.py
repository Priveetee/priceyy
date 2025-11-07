import argparse

from src import aws_ingestor, azure_ingestor, gcp_ingestor


def main():
    parser = argparse.ArgumentParser(description="Run the price ingestion worker.")
    parser.add_argument(
        "--provider",
        choices=["aws", "azure", "gcp"],
        help="Run ingestion for a specific provider.",
    )
    parser.add_argument(
        "--force", action="store_true", help="Force run even if state is up to date."
    )
    args = parser.parse_args()

    try:
        if not args.provider or args.provider == "aws":
            aws_ingestor.ingest(force=args.force)

        if not args.provider or args.provider == "azure":
            azure_ingestor.ingest(force=args.force)

        if not args.provider or args.provider == "gcp":
            gcp_ingestor.ingest(force=args.force)

    except Exception as e:
        print(f"An unexpected error occurred in the main process: {e}")


if __name__ == "__main__":
    main()
