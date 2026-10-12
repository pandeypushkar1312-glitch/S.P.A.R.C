import 'package:flutter_test/flutter_test.dart';
import 'package:voltride_app/main.dart';

void main() {
  testWidgets('VOLTRIDE initial home screen renders', (WidgetTester tester) async {
    await tester.pumpWidget(const VoltrideApp());
    expect(find.text('VOLTRIDE'), findsOneWidget);
    expect(find.text('DEMO MODE'), findsOneWidget);
    expect(find.text('Order Rover to My Location'), findsOneWidget);
  });
}
