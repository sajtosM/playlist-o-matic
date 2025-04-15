import fs from 'fs';
import { z } from 'zod';

export type SavedChannel = {
    channelName: string;
    count?: number;
    category?: string | null;
}

export const addChannelList = async () => {

    const wl = fs.readFileSync('data/wl.json', 'utf8');
    const wlObj = JSON.parse(wl);

    const channelList: SavedChannel[] = [... new Set(wlObj.map(x => x.channelName))]
        .map((x: string) => {
            return {
                channelName: x,
                count: wlObj.filter(y => y.channelName === x).length,
                category: null
            }
        })
        .sort((a, b) => {
            return b.count - a.count;
        });
    console.table(channelList);
    console.log(`Channels in watchlist: ${channelList.length}`);

    let channelListCsv = '';
    let existingchannels: SavedChannel[] = [];
    // read the csv file if it exists
    if (fs.existsSync('data/channelList.csv')) {
        channelListCsv = fs.readFileSync('data/channelList.csv', 'utf8');
        existingchannels = channelListCsv.split('\n').map(row => {
            const content = row.split(';').map(x => x.trim().replace(/"/g, '').replace(/\r/g, ''));
            return {
                channelName: content[0],
                category: content[1] || null,
            }
        });
        existingchannels.shift(); // remove the header
        console.log(`Current csv channels: ${existingchannels.length}`);
    } else {
        channelListCsv = 'channelName;category\n';
    }

    let counter = 0;

    const concatChannelList = existingchannels.concat(channelList
        .filter(x => {
            return !existingchannels.map(x => x.channelName).includes(x.channelName);
        }));


    channelListCsv += '\n' + channelList
        .filter(x => {
            return !existingchannels.map(x => x.channelName).includes(x.channelName);
        })
        .map((x) => {
            counter++;
            return `${x.channelName};;`;
        }).join('\n');

    console.log(`New channels added: ${counter}`);

    fs.writeFileSync('data/channelList.csv', channelListCsv, 'utf8');

    console.table(concatChannelList);
    return concatChannelList;
};

// addchannelList();
