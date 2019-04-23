provider "google" {
  credentials = "${file("~/.gcloud/tierion-iglesias-f4b34449d457.json")}"
  project     = "tierion-iglesias"
  region      = "us-central1"
}

resource "google_compute_instance" "chp-node" {
  name         = "chp-node-${count.index}"
  machine_type = "n1-standard-1"
  zone         = "us-central1-a"
  count = "${var.node_count}"

  tags = ["chainpoint", "hydra"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-1804-lts"
    }
  }

  // Local SSD disk
  scratch_disk {
  }

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