import struct
import zlib


def read_png_rgba(path):
    data = path.read_bytes()
    chunks, offset = {}, 8
    while offset < len(data):
        length, kind = struct.unpack_from(">I4s", data, offset)
        chunks[kind] = chunks.get(kind, b"") + data[offset + 8:offset + 8 + length]
        offset += length + 12
    width, height, depth, color_type, _, _, interlace = struct.unpack(">IIBBBBB", chunks[b"IHDR"])
    if (depth, color_type, interlace) != (8, 6, 0):
        raise SystemExit(f"{path} must be an 8-bit RGBA PNG without interlacing")
    raw = zlib.decompress(chunks[b"IDAT"])
    stride = width * 4
    rows, previous = [], bytearray(stride)
    for y in range(height):
        start = y * (stride + 1)
        filter_type, row = raw[start], bytearray(raw[start + 1:start + 1 + stride])
        for i in range(stride):
            left = row[i - 4] if i >= 4 else 0
            up = previous[i]
            up_left = previous[i - 4] if i >= 4 else 0
            if filter_type == 1:
                row[i] = (row[i] + left) & 255
            elif filter_type == 2:
                row[i] = (row[i] + up) & 255
            elif filter_type == 3:
                row[i] = (row[i] + (left + up) // 2) & 255
            elif filter_type == 4:
                estimate = left + up - up_left
                distances = (abs(estimate - left), abs(estimate - up), abs(estimate - up_left))
                row[i] = (row[i] + (left, up, up_left)[distances.index(min(distances))]) & 255
        rows.append(row)
        previous = row
    return width, height, b"".join(rows)


def resize_nearest(width, height, rgba, size):
    rows = []
    for y in range(size):
        source_y = (2 * y + 1) * height // (2 * size)
        for x in range(size):
            start = (source_y * width + (2 * x + 1) * width // (2 * size)) * 4
            rows.append(rgba[start:start + 4])
    return size, size, b"".join(rows)


def encode_qoi(width, height, rgba):
    out = bytearray(b"qoif" + struct.pack(">IIBB", width, height, 4, 0))
    seen = [(0, 0, 0, 0)] * 64
    previous, run = (0, 0, 0, 255), 0
    pixels = [tuple(rgba[i:i + 4]) for i in range(0, len(rgba), 4)]
    for index, pixel in enumerate(pixels):
        if pixel == previous:
            run += 1
            if run == 62 or index == len(pixels) - 1:
                out.append(0xC0 | (run - 1))
                run = 0
            continue
        if run:
            out.append(0xC0 | (run - 1))
            run = 0
        r, g, b, a = pixel
        slot = (r * 3 + g * 5 + b * 7 + a * 11) % 64
        if seen[slot] == pixel:
            out.append(slot)
        elif a != previous[3]:
            out += bytes((0xFF, r, g, b, a))
        else:
            dr, dg, db = (r - previous[0] + 128) % 256 - 128, (g - previous[1] + 128) % 256 - 128, (b - previous[2] + 128) % 256 - 128
            if -2 <= dr <= 1 and -2 <= dg <= 1 and -2 <= db <= 1:
                out.append(0x40 | (dr + 2) << 4 | (dg + 2) << 2 | (db + 2))
            elif -32 <= dg <= 31 and -8 <= dr - dg <= 7 and -8 <= db - dg <= 7:
                out += bytes((0x80 | (dg + 32), (dr - dg + 8) << 4 | (db - dg + 8)))
            else:
                out += bytes((0xFE, r, g, b))
        seen[slot] = pixel
        previous = pixel
    return bytes(out + b"\x00" * 7 + b"\x01")
