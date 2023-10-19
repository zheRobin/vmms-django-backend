import { GetPlaylistSoundsAmountPipe } from './get-playlist-sounds-amount.pipe';

describe('GetSoundsAmountPipe', () => {
  it('create an instance', () => {
    const pipe = new GetPlaylistSoundsAmountPipe();
    expect(pipe).toBeTruthy();
  });
});
