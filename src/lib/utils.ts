export function shortAddress(address?: string): string | undefined {
    if (address) {
        const start = address.substring(0, 4 + 10);
        const end = address.substring(address.length - 3);
        return `${start}...${end}`
    } else {
        return undefined;
    }
}
//RPC_URL=https://eth-holesky.g.alchemy.com/v2/Xx3ekybOdrn_otnfqslDmfaxEKHoiBNs6