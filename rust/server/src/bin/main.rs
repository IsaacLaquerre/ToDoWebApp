use std::fs;
use std::net::TcpListener;
use std::net::TcpStream;
use std::io::prelude::*;
use std::path::{Path, PathBuf};

use server::ThreadPool;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

        let pool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        pool.execute( || {
            handle_connection(stream);
        });
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 4096];

    if stream.read(&mut buffer).is_err() {
        return;
    }

    // ---- Parse request line ----
    let request = String::from_utf8_lossy(&buffer);
    let first_line = match request.lines().next() {
        Some(line) => line,
        None => return,
    };

    let raw_path = first_line
        .split_whitespace()
        .nth(1)
        .unwrap_or("/");

    // Remove query string
    let raw_path = raw_path.split('?').next().unwrap_or("/");

    // URL decode (requires `urlencoding` crate)
    let decoded_path = urlencoding::decode(raw_path)
        .unwrap_or_else(|_| raw_path.into());

    let base_path = Path::new("../../public");

    // Map "/" to index.html
    let requested_path = if decoded_path == "/" {
        "views/index.html"
    } else {
        decoded_path.trim_start_matches('/')
    };

    // ---- Attempt to resolve file safely ----
    let file_path = sanitize_path(base_path, requested_path);

    let (status_line, contents, content_type) = match file_path {
        Some(path) if path.is_file() => {
            match fs::read(&path) {
                Ok(data) => (
                    "HTTP/1.1 200 OK",
                    data,
                    content_type(&path),
                ),
                Err(_) => (
                    "HTTP/1.1 500 INTERNAL SERVER ERROR",
                    b"Internal Server Error".to_vec(),
                    "text/plain",
                ),
            }
        }
        _ => {
            // Always serve 404.html from inside base path
            let not_found = sanitize_path(base_path, "views/404.html")
                .and_then(|p| fs::read(p).ok())
                .unwrap_or_else(|| b"Not Found".to_vec());

            (
                "HTTP/1.1 404 NOT FOUND",
                not_found,
                "text/html",
            )
        }
    };

    // ---- Build response ----
    let header = format!(
        "{}\r\nContent-Length: {}\r\nContent-Type: {}\r\nConnection: close\r\n\r\n",
        status_line,
        contents.len(),
        content_type
    );

    let _ = stream.write(header.as_bytes());
    let _ = stream.write(&contents);
    let _ = stream.flush();
}

fn content_type(path: &std::path::Path) -> &'static str {
    match path.extension().and_then(|ext| ext.to_str()) {
        Some("html") => "text/html",
        Some("css") => "text/css",
        Some("js") => "application/javascript",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        _ => "application/octet-stream",
    }
}

fn sanitize_path(base: &Path, requested: &str) -> Option<PathBuf> {
    // Remove leading slash so it doesn't become absolute
    let requested = requested.trim_start_matches('/');

    let full_path = base.join(requested);

    // Canonicalize both paths (resolve .. and symlinks)
    let canonical_base = base.canonicalize().ok()?;
    let canonical_full = full_path.canonicalize().ok()?;

    // Ensure the resolved file is inside the base directory
    if canonical_full.starts_with(&canonical_base) {
        Some(canonical_full)
    } else {
        None
    }
}