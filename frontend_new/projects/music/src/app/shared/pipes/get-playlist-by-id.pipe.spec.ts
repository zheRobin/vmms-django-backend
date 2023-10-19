import { GetPlaylistByIdPipe } from './get-playlist-by-id.pipe';

describe('GetPlaylistByIdPipe', () => {
  it('create an instance', () => {
    const pipe = new GetPlaylistByIdPipe();
    expect(pipe).toBeTruthy();
  });
});
