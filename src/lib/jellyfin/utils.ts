
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Checks if the list includes any value from the search.
 * @param list The list to search in.
 * @param search The values to search.
 * @returns _true_ if the list includes any value from the search.
 * @remarks The list (string) can start with '-', in which case the logic is inverted.
 */
export function includesAny(list: string | string[] | null | undefined, search: string | string[]): boolean {
    if (!list) {
        return true;
    }

    let inverseMatch = false;
    let listArray: string[] = [];

    if (typeof list === 'string') {
        if (list.startsWith('-')) {
            inverseMatch = true;
            list = list.substring(1);
        }

        listArray = list.split(',');
    } else {
        listArray = list;
    }

    listArray = listArray.filter(i => i);

    if (!listArray.length) {
        return true;
    }

    let searchArray: string[] = [];
    if (typeof search === 'string') {
        searchArray = search.split(',');
    } else {
        searchArray = search;
    }

    searchArray = searchArray.filter(i => i);

    if (searchArray.some(s => listArray.includes(s))) {
        return !inverseMatch;
    }

    return inverseMatch;
}

/**
 * Checks if the media source is an HLS stream.
 * @param mediaSource The media source.
 * @returns _true_ if the media source is an HLS stream, _false_ otherwise.
 */
export function isHls(mediaSource: any | null | undefined): boolean {
    return mediaSource?.TranscodingSubProtocol?.toUpperCase() === 'HLS'
        || mediaSource?.Container?.toUpperCase() === 'HLS';
}

export function isLocalItem(item: any): boolean {
    // Basic implementation - assume mostly false for now unless we have local file access
    // This is used for subtitle paths etc.
    return false;
}

