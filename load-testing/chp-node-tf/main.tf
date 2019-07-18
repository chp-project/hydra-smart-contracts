provider "google" {
  credentials = "${file("/var/go/.gcloud/chainpoint-hashblaster-c2b2c6e39e76.json")}"
  project     = "chainpoint-hashblaster"
  region      = "us-central1"
}

terraform {
  backend "gcs" {
    bucket = "hashblaster-chp-testnet-nodes"
  }
}

resource "google_compute_instance" "chp-node" {
  name         = "chp-node-r2-${count.index}"
  machine_type = "n1-standard-1"
  zone         = "us-central1-a"
  count        = "${var.node_count}"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-1804-lts"
    }
  }

  # // Local SSD disk
  # scratch_disk {}

  network_interface {
    network = "default"

    access_config {
      // Ephemeral IP
    }
  }

  metadata = {
    project = "chainpoint-hydra"
  }

  metadata_startup_script = "${data.template_file.init.rendered}"

  service_account {
    scopes = ["compute-rw", "storage-rw"]
  }

  tags = ["http", "web-sg"]
}

resource "google_compute_firewall" "web-sg" {
  name    = "web-sg"
  network = "default"

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080"]
  }

  source_ranges = ["0.0.0.0/0"]
}

data "template_file" "init" {
  template = "${file("${path.module}/scripts/startup.sh")}"

  # vars {
  #   db_name     = "${var.db_name}"
  #   db_user     = "${var.db_user}"
  #   db_password = "${var.db_password}"
  #   db_ip       = "${var.db_ip}"
  # }
}
