import { KinetixChatPage } from './app.po';

describe('kinetix-chat App', () => {
  let page: KinetixChatPage;

  beforeEach(() => {
    page = new KinetixChatPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
