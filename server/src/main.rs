use argon2::{hash_raw, Config, ThreadMode, Variant, Version};
use axum::{http::StatusCode, routing::post, Json, Router, Server};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

const CONFIG: Config = Config {
	variant: Variant::Argon2id,
	version: Version::Version13,
	mem_cost: 65536,
	time_cost: 4,
	lanes: 8,
	thread_mode: ThreadMode::Parallel,
	secret: &[],
	ad: &[],
	hash_length: 46,
};
const LOWERCASE: &str = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMERIC: &str = "0123456789";
const SPECIAL: &str = "!@#$%^&*";

#[tokio::main]
async fn main() {
	let app = Router::new()
		.route("/", post(handler))
		.layer(CorsLayer::permissive());

	let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
	println!("listening on {}!", addr);

	Server::bind(&addr)
		.serve(app.into_make_service())
		.await
		.unwrap();
}

async fn handler(Json(payload): Json<Request>) -> (StatusCode, Json<Response>) {
	let hash = hash_raw(
		payload.key.to_lowercase().as_bytes(),
		payload.seed.as_bytes(),
		&CONFIG,
	)
	.unwrap();

	let mut res: String = String::new();

	let characters = String::new() + LOWERCASE + UPPERCASE + NUMERIC + SPECIAL;

	for e in hash.get(0..16).unwrap() {
		res += &(characters.as_bytes()[*e as usize % characters.len()] as char).to_string();
	}

	let mut pos: usize = 0;

	for (i, e) in hash.get(16..46).unwrap().iter().enumerate() {
		if i % 2 == 0 {
			pos = *e as usize % res.len();
			continue;
		}

		let charset = match i {
			0..=15 => LOWERCASE,
			16..=23 => UPPERCASE,
			24..=27 => NUMERIC,
			28..=29 => SPECIAL,
			_ => "",
		};

		res.replace_range(
			pos..pos + 1,
			&(charset.as_bytes()[*e as usize % charset.len()] as char).to_string(),
		);
	}

	(StatusCode::OK, Json(Response { res }))
}

#[derive(Deserialize)]
struct Request {
	seed: String,
	key: String,
}

#[derive(Serialize)]
struct Response {
	res: String,
}
