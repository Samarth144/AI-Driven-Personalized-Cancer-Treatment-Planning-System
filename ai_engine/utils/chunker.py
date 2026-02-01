def chunk_text(text, max_chars=500):
    words = text.split()
    chunks = []
    buf = []

    for w in words:
        buf.append(w)
        if sum(len(x) for x in buf) > max_chars:
            chunks.append(" ".join(buf))
            buf = []
    if buf:
        chunks.append(" ".join(buf))

    return chunks
